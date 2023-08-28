import { CreationOptional, DataTypes, Model } from "sequelize"
import sequelize from "../config/database"
import Elevator from "./Elevator"

interface PendingElevatorCallAttributes {
    ElevatorId: number,
    targetFloor: number,
    executed: boolean,
    executionDuration: null | number
}

class PendingElevatorCall extends Model<PendingElevatorCallAttributes> implements PendingElevatorCallAttributes {
    public ElevatorId!: number
    public targetFloor!: number
    public executed!: boolean
    public executionDuration!: CreationOptional<number>
}

PendingElevatorCall.init({
    ElevatorId: {
        type: DataTypes.INTEGER,
        references: {
            model: Elevator,
            key: 'id'
        }
    },
    targetFloor: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    executed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    executionDuration: {
        type: DataTypes.TIME,
        allowNull: true
    }
},
    {
        sequelize,
        modelName: 'PendingElevatorCall'
    }
)

Elevator.hasMany(PendingElevatorCall)

export default PendingElevatorCall