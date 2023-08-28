// models/Elevator.ts
import { CreationOptional, DataTypes, Model } from 'sequelize'
import sequelize from '../config/database'
import Building from './Building'

interface ElevatorAttributes {
    name: string
    currentState: string
    BuildingId: CreationOptional<number>
}

class Elevator extends Model<ElevatorAttributes> implements ElevatorAttributes {
    declare id: CreationOptional<number>
    public name!: string
    public currentState!: string
    public BuildingId!: CreationOptional<number>
}

Elevator.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        currentState: {
            type: DataTypes.ENUM('stuck', 'idle', 'doorsOpening', 'doorsOpen', 'doorsClosing', 'doorsClosed', 'MovingUp', 'MovingDown', 'Stopped'),
            defaultValue: 'idle',
        },
        BuildingId: {
            type: DataTypes.INTEGER,
            references: {
                model: Building,
                key: 'id',
            },
        },
    },
    {
        sequelize,
        modelName: 'Elevator',
    }
)

Building.hasMany(Elevator)

export default Elevator
