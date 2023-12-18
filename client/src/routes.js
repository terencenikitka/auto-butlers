import App from "./components/App";
import Creatures from "./components/Creatures";
import Decks from "./components/Decks";
import ErrorPage from "./components/ErrorPage";
import Home from "./components/Home";
import Game from "./components/Game";
import CreateDeck from "./components/CreateDeck";
import Signup from "./components/Signup";
const routes = [
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <Signup />
            },
            {
                path:'/creatures',
                element:<Creatures/>
            },
            {
                path:'/decks',
                element:<Decks/>
            },
            {
                path:'/game',
                element:<Game/>
            },
            {
                path:'/createdeck',
                element:<CreateDeck/>
            }
        ]}]



        
export default routes;        