import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { Category } from "./Category"
import { OrderItem } from "./OrderItem"

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column("decimal", { precision: 10, scale: 2 })
    price: number

    @Column()
    description: string

    @Column()
    stock: number

    @ManyToOne(() => Category, category => category.products)
    category: Category

    @OneToMany(() => OrderItem, orderItem => orderItem.product)
    orderItems: OrderItem[]
}
