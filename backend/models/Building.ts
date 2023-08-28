import { CreationOptional, DataTypes, Model } from "sequelize"
import sequelize from "../config/database"

interface BuildingAttributes {
    name: string,
    number_of_floors: number,
    active: boolean
}

class Building extends Model<BuildingAttributes> implements BuildingAttributes {
    declare id: CreationOptional<number>
    public name!: string
    public number_of_floors!: number
    public active!: boolean
}

Building.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        number_of_floors: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        sequelize,
        modelName: 'Building',
    }
)

export default Building

