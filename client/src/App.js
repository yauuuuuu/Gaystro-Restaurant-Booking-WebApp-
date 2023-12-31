import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";
import LoginForm from "./views/LoginPage";
import ContactUs from "./components/ContactUs";
import RegisterForm from "./views/RegisterPage";
import ForgetPassword from "./components/ForgetPassword";
import RestaurantPage from "./views/RestaurantPage";
import ManageRestaurantPage from "./views/ManageRestaurantPage";
import UpdateRestaurantPage from "./views/UpdateRestaurantPage";
import ReservationPage from "./views/ReservationPage";
import FavouriteRestaurantPage from "./views/FavouriteRestaurantPage";
import TAndC from "./components/TAndC";
import HomePage from "./views/HomePage";
import ProfilePage from "./views/ProfilePage";
import UpdateProfilePage from "./views/UpdateProfilePage";
import RestaurantSearchPage from "./views/RestaurantSearchPage";
import { Routes, Route} from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import axios from 'axios';

// Create a context
export const MyContext = createContext();

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState({})
    const [restaurant, setRestaurant] = useState({})

    useEffect(() => {
      // Check for the user's login status when the component mounts
      const loginToken = localStorage.getItem('loginToken');
  
      if (loginToken) {
          (async () => {
            axios.get(`${process.env.REACT_APP_SERVER_URL}/api/users/${loginToken}`)
            .then(response => {
                console.log('User data:', response.data);
                setIsAuthenticated(true)
                setUser(response.data)
            })
            .catch(error => {
                if (error.response) console.error(`User data not found: ${error.response} | Status: ${error.response.status}`);
                else console.log(`Error: ${error}`)
                setIsAuthenticated(false)
            });
          })();
      }
    }, []);

    useEffect(() => {
        // Load restaurant details if user is restaurant owner
        if (user.role === 'restaurateur' && user.restaurantOwned !== null) {
          (async () => {
            axios.get(`${process.env.REACT_APP_SERVER_URL}/api/users/${user._id}/manager/details`)
            .then(response => {
                console.log('Restaurant data:', response.data);
                setRestaurant(response.data)
            })
            .catch(error => {
                if (error.response) console.error(`User data not found: ${error.response} | Status: ${error.response.status}`);
                else console.log(`Error: ${error}`)
            });
          })();
        }
    }, [user])


    return (
      <div className="App"> 
      <MyContext.Provider value={{user}}>
            <Navbar role={user.role} name={user.firstName + " " + user.lastName} setIsAuthenticated={setIsAuthenticated} setUser={setUser}/>
            <Routes>
                <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} userRole={user.role}/>} /> 
                {/* Pages for Guest Only */}
                {!isAuthenticated && (
                  <>
                      <Route path="/login" element={<LoginForm setIsAuthenticated={setIsAuthenticated} setUser={setUser}/>} />
                      <Route path="/register" element={<RegisterForm setIsAuthenticated={setIsAuthenticated} setUser={setUser}/>} />
                      <Route path="/forgetpassword" element={<ForgetPassword/>}/> 
                  </>
                )}

                {/* Pages for Customer Only*/}
                { isAuthenticated && user.role.toLowerCase()==="customer" && (
                  <>
                      <Route path="/favourite" element={<FavouriteRestaurantPage/>}/>
                  </>
                )}

                {/* Pages for Restaurant Owner Only */}
                { isAuthenticated && user.role.toLowerCase()==="restaurateur" && (
                  <>
                      <Route path="/restaurant/manage" element={<ManageRestaurantPage restaurant={restaurant}/>}/>
                      <Route path="/restaurant/manage/update" element={<UpdateRestaurantPage restaurant={restaurant} setRestaurant={setRestaurant}/>}/>
                  </>
                )}

                {/* Pages for Both Customer and Restaurant Owner*/}
                { isAuthenticated && (
                  <>
                      <Route path="/profile" element={<ProfilePage user={user}/>} />
                      <Route path="/profile/update" element={<UpdateProfilePage user={user} setUser={setUser}/>} />
                      <Route path="/reservations" element={<ReservationPage/>}/>
                  </>
                )}

                {/* Pages for public */}
                <Route path="/restaurant/:id" element={<RestaurantPage isAuthenticated={isAuthenticated}/>}/> 
                <Route path="/restaurant/search" element={<RestaurantSearchPage />} />
                <Route path="/aboutus" element={<AboutUs/>}/>
                <Route path="/contactus" element={<ContactUs/>}/>
                <Route path="/tandc" element={<TAndC/>}/>
                <Route path="*" element={<h2>404 Page not found</h2>}/>
            </Routes>
            <Footer />
      </MyContext.Provider>
      </div>
    ) 
}

export default App;
