import { createRoot } from "react-dom/client";
import {createBrowserRouter, RouterProvider,
} from "react-router-dom";
import "./index.css";
import routes from "./routes";


const container = document.getElementById("root");

const router = createBrowserRouter(routes)

const root = createRoot(container);
root.render(<RouterProvider router={router} />);