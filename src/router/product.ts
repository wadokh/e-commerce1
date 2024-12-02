import Router from "koa-router";
import { ProductController } from "../controllers/ProductController";

const routerOpts: Router.IRouterOptions = {
    prefix: "/products",
};

const router: Router = new Router(routerOpts);

router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.post("/", ProductController.createProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);

export default router;
