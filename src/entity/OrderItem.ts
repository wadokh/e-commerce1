import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Order } from "./Order"
import { Product } from "./Product"

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Product, (product) => product.orderItems)
    product: Product;

    @ManyToOne(() => Order, (order) => order.orderItems)
    order: Order;

    @Column()
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;
}