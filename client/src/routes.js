import App from "./components/App";
import Creatures from "./components/Creatures";
import ErrorPage from "./components/ErrorPage";
import Home from "./components/Home";
const routes = [
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path:'/creatures',
                element:<Creatures/>
            }
        ]}]



        
export default routes;        