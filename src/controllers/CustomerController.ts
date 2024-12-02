import { Context } from "koa";
import { AppDataSource } from "../data-source";
import { Customer } from "../entity/Customer";
import { StatusCodes} from "../utils/StatusCodes";

export class CustomerController {
    static async getAllCustomers(ctx: Context) {
        try {
            console.log("Customer GET request");
            const customerRepository = AppDataSource.getRepository(Customer);
            ctx.body = await customerRepository.find();
        } catch (error) {
            console.error("Error fetching customers:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async getCustomerById(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            if (isNaN(id)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }

            console.log(`${id} customer GET request`);
            const customerRepository = AppDataSource.getRepository(Customer);
            const customer = await customerRepository.findOne({
                where: { id },
            });

            if (!customer) {
                ctx.throw(StatusCodes.NOT_FOUND, "Customer not found");
            }

            ctx.body = customer;
        } catch (error) {
            console.error("Error fetching customer by ID:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async createCustomer(ctx: Context) {
        try {
            console.log("Customer POST request");
            const body: any = await ctx.request.body;

            if (!body.email) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Email is required.");
            }

            const customerRepository = AppDataSource.getRepository(Customer);
            const existingCustomer = await customerRepository.findOne({
                where: { email: body.email },
            });

            if (existingCustomer) {
                ctx.throw(StatusCodes.UNPROCESSABLE_ENTITY, "Email must be unique.");
            }

            const customer = customerRepository.create({
                firstName: body.firstName,
                lastName: body.lastName || "",
                email: body.email,
                address: body.address || "India",
            });

            await customerRepository.save(customer);
            ctx.body = customer;
        } catch (error) {
            console.error("Error creating customer:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async updateCustomer(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            if (isNaN(id)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }

            console.log(`${id} customer PUT request`);
            const body: any = await ctx.request.body;

            if (!body.email) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Email is required.");
            }

            const customerRepository = AppDataSource.getRepository(Customer);
            const existingCustomer = await customerRepository.findOne({
                where: { id },
            });

            if (!existingCustomer) {
                ctx.throw(StatusCodes.NOT_FOUND, "Customer not found.");
            }

            const emailConflict = await customerRepository.findOne({
                where: { email: body.email },
            });

            if (emailConflict && emailConflict.id !== id) {
                ctx.throw(StatusCodes.UNPROCESSABLE_ENTITY, "Email must be unique.");
            }

            existingCustomer.firstName = body.firstName;
            existingCustomer.lastName = body.lastName || "";
            existingCustomer.email = body.email;
            existingCustomer.address = body.address || "India";

            await customerRepository.save(existingCustomer);
            ctx.body = existingCustomer;
        } catch (error) {
            console.error("Error updating customer:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }

    static async deleteCustomer(ctx: Context) {
        try {
            const id = parseInt(ctx.params.id);
            if (isNaN(id)) {
                ctx.throw(StatusCodes.BAD_REQUEST, "Invalid ID format. ID must be a number.");
            }

            console.log(`${id} customer DELETE request`);
            const customerRepository = AppDataSource.getRepository(Customer);
            const customer = await customerRepository.findOne({ where: { id } });

            if (!customer) {
                ctx.throw(StatusCodes.NOT_FOUND, "Customer not found.");
            }

            await customerRepository.remove(customer);
            ctx.body = `Customer with ID ${id} has been deleted.`;
        } catch (error) {
            console.error("Error deleting customer:", error);
            ctx.throw(StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error");
        }
    }
}
