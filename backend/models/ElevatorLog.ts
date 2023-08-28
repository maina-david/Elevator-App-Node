import { CreationOptional, DataTypes, Model } from "sequelize"
import sequelize from "../config/database"
import Elevator from "./Elevator"

interface ElevatorLogAttributes {
    ElevatorId: number,
    currentFloor: number,
    state: string,
    direction: string | null,
    action: string | null,
    details: string | null
}

class ElevatorLog extends Model<ElevatorLogAttributes> implements ElevatorLogAttributes {
    declare id: CreationOptional<number>
    public ElevatorId!: number
    public currentFloor!: number
    public state!: string
    public direction!: string | null
    public action!: string | null
    public details!: string | null
}

ElevatorLog.init({
    ElevatorId: {
        type: DataTypes.INTEGER,
        references: {
            model: Elevator,
            key: 'id'
        }
    },
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

export default ElevatorLog
