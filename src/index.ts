import "reflect-metadata"
import { AppDataSource } from "./data-source"
import { Category } from "./entity/Category"
import { Product } from "./entity/Product"
import { Customer } from "./entity/Customer"
import { Order } from "./entity/Order"
import { OrderItem } from "./entity/OrderItem"

AppDataSource.initialize().then(async () => {
    try {
        console.log("test")
        const electronicsCategory = new Category()
        electronicsCategory.name = "Electronics"
        electronicsCategory.description = "Electronic devices and gadgets"
        await AppDataSource.manager.save(electronicsCategory)

        const clothingCategory = new Category()
        clothingCategory.name = "Clothing"
        clothingCategory.description = "Fashion and apparel"
        await AppDataSource.manager.save(clothingCategory)

        console.log("test2")

        const laptop = new Product()
        laptop.name = "Dell inspiron"
        laptop.price = 40000
        laptop.description = "Work laptop"
        laptop.stock = 10
        laptop.category = electronicsCategory
        await AppDataSource.manager.save(laptop)

        const tshirt = new Product()
        tshirt.name = "Cotton T-Shirt"
        tshirt.price = 600
        tshirt.description = "Comfortable cotton t-shirt for summers"
        tshirt.stock = 100
        tshirt.category = clothingCategory
        await AppDataSource.manager.save(tshirt)


        console.log("adding customr test")
        const customer = new Customer()
        customer.firstName = "Vaibhav"
        customer.lastName = "Joshi"
        customer.email = "vaibhavjoshi0987@gmail.com"
        customer.address = "Beta 2, Greater Noida"
        await AppDataSource.manager.save(customer)


        const order = new Order()
        order.customer = customer
        order.status = "pending"
        order.totalAmount = 41800
        order.orderItems=[]
        console.log("line 54")
        await AppDataSource.manager.save(order)
        console.log("line 56")
        const laptopOrderItem = new OrderItem()
        laptopOrderItem.order = order
        laptopOrderItem.product = laptop
        laptopOrderItem.quantity = 1
        laptopOrderItem.price = laptop.price
        await AppDataSource.manager.save(laptopOrderItem)
        console.log("added first item")

        order.orderItems.push(laptopOrderItem)

        const tshirtOrderItem = new OrderItem()
        tshirtOrderItem.order = order
        tshirtOrderItem.product = tshirt
        tshirtOrderItem.quantity = 3
        tshirtOrderItem.price = tshirt.price
        await AppDataSource.manager.save(tshirtOrderItem)

        await AppDataSource.manager.save(order)

        order.orderItems.push(tshirtOrderItem)
        console.log("finished")
    } catch (error) {
        console.error(error)
    }

}).catch(error => console.log(error))