import Router from "koa-router";
import { CategoryController } from "../controllers/CategoryController";

const routerOpts: Router.IRouterOptions = {
    prefix: "/category",
};

const router: Router = new Router(routerOpts);

router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);
router.post("/", CategoryController.createCategory);
router.put("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

export default router;
