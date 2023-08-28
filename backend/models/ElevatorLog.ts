import { CreationOptional, DataTypes, Model } from "sequelize"
import sequelize from "../config/database"
import Elevator from "./Elevator"

interface ElevatorLogAttributes {
    currentFloor: number,
    state: string,
    direction: string | null,
    action: string,
    details: string
}

class ElevatorLog extends Model<ElevatorLogAttributes> implements ElevatorLogAttributes {
    declare id: CreationOptional<number>
    public currentFloor!: number
    public state!: string
    public direction!: string | null
    public action!: string
    public details!: string
}

ElevatorLog.init({
    currentFloor: {
        type: DataTypes.INTEGER
    },
    state: {
        type: DataTypes.STRING(10)
    },
    direction: {
        type: DataTypes.STRING(2)
    },
    action: {
        type: DataTypes.STRING(5)
    },
    details: {
        type: DataTypes.TEXT
    },
},
    {
        sequelize,
        modelName: 'ElevatorLog'
    }
)

Elevator.hasMany(ElevatorLog)

export default ElevatorLog
