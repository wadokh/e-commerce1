import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm"
import { Customer } from "./Customer"
import { OrderItem } from "./OrderItem"

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn()
    orderDate: Date

    @Column({
        type: "enum",
        enum: ["pending", "processing", "shipped", "delivered"],
        default: "pending"
    })
    status: string

    @Column("decimal", { precision: 10, scale: 2 })
    totalAmount: number

    @ManyToOne(() => Customer, customer => customer.orders)
    customer: Customer

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    orderItems: OrderItem[]
}
