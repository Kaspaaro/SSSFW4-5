import CatModel from '../models/catModel';
import {Cat, LocationInput} from '../../types/DBTypes';
import {MyContext} from '../../types/MyContext';
import {isLoggedIn} from '../../functions/authorize';
export default {
    Query: {
        cats: async () => {
            return CatModel.find();
        },
        catById: async (_parent: undefined, args: {id: string}) => {
            return CatModel.findById(args.id);
        },
        catsByArea: async (_parent: undefined, args: LocationInput) => {
            const rightCorner = [args.topRight.lng, args.topRight.lat];
            const leftCorner = [args.bottomLeft.lng, args.bottomLeft.lat];

            return CatModel.find({
                location: {
                    $geoWithin: {
                        $box: [leftCorner, rightCorner],
                    },
                },
            });
        },
        catsByOwner: async (_parent: undefined, args: {ownerId: string}) => {
            return CatModel.find({owner: args.ownerId});
        },
    },

    Mutation: {
        createCat: async (
            _parent: undefined,
            args: {input: Omit<Cat, 'id'>},
            context: MyContext,
        ) => {
            isLoggedIn(context);
            args.input.owner = context.userdata?.user.id;
            return await CatModel.create(args.input);
        },
        updateCat: async (
            _parent: undefined,
            args: {id: string; input: Partial<Omit<Cat, 'id'>>},
            context: MyContext,
        ) => {
            isLoggedIn(context);
            if (context.userdata?.user.role !== 'admin') {
                const filter = {_id: args.id, owner: context.userdata?.user.id};
                return CatModel.findOneAndUpdate(filter, args.input, {new: true});
            } else {
                return CatModel.findByIdAndUpdate(args.id, args.input, {
                    new: true,
                });
            }
        },
        deleteCat: async (
            _parent: undefined,
            args: {id: string},
            context: MyContext,
        ) => {
            isLoggedIn(context);
            if (context.userdata?.user.role !== 'admin') {
                const filter = {_id: args.id, owner: context.userdata?.user.id};
                return CatModel.findOneAndDelete(filter);
            } else {
                return CatModel.findByIdAndDelete(args.id);
            }
        },
    },
};
