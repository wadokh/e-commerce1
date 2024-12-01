import "reflect-metadata"
import { DataSource } from "typeorm"
import { Product } from "./entity/Product"
import { Category } from "./entity/Category"
import { Customer } from "./entity/Customer"
import { Order } from "./entity/Order"
import { OrderItem } from "./entity/OrderItem"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5430,
    username: "postgres",
    password: "password",
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [Product, Category, Customer, Order, OrderItem],
    migrations: [],
    subscribers: [],
})
