import { CreationOptional, DataTypes, Model } from "sequelize"
import sequelize from "../config/database"

interface UserAttributes {
    name: string
    email: string
    password: string
}

class User extends Model<UserAttributes> implements UserAttributes {
    declare id: CreationOptional<number>
    public name!: string
    public email!: string
    public password!: string
}

User.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'User',
    }
)

export default User
