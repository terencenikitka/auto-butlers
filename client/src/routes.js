import App from "./components/App";
import Creatures from "./components/Creatures";
import Decks from "./components/Decks";
import ErrorPage from "./components/ErrorPage";
import Home from "./components/Home";
import CreateDeck from "./components/CreateDeck";
import Signup from "./components/Signup";
import StartGame from "./components/StartGame";
import Game from "./components/Game";
const routes = [
    {
        path: "/",
        element: <App />,
        errorElement: <ErrorPage />,
        children: [
         
            {
                path:'/creatures',
                element:<Creatures/>
            },
            {
                path:'/decks',
                element:<Decks/>
            },
            {
                path:'/startgame',
                element:<StartGame/>
            },
            {
                path:'/createdeck',
                element:<CreateDeck/>
            },
            {
                path:'/game',
                element:<Game/>
            }
        ]}]



        
export default routes;        