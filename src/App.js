import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes } from '~/routes';
import { Fragment } from 'react';
import { SnackbarProvider } from 'notistack';
import Apis, { endpoints } from '~/configs/Apis';
import cookies from 'react-cookies';
import { useDispatch } from 'react-redux';
import { logoutUser } from './ActionCreators/UserCreator';

function App() {
    const dispatch = useDispatch();
    const checkLogin = async () => {
        try {
            let user = await Apis.get(endpoints['current-user'], {
                headers: {
                    Authorization: `Bearer ${cookies.load('access_token')}`,
                },
            });
            // Login hợp lệ
            if (user.data.id === cookies.load('user').id) {
            }
            // Không hợp lệ
            else {
                cookies.remove('access_token');
                cookies.remove('user');
                dispatch(logoutUser());
            }
        } catch (err) {
            // setLogin(false);
            if (err.message === 'Request failed with status code 401') {
                cookies.remove('access_token');
                cookies.remove('user');
                dispatch(logoutUser());
            }
        }
    };
    checkLogin();
    return (
        <Router>
            <div className="App">
                <Routes>
                    {publicRoutes.map((route, index) => {
                        const Layout = route.layout === null ? Fragment : route.layout;
                        const Page = route.component;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
                                        <Layout>
                                            <Page />
                                        </Layout>
                                    </SnackbarProvider>
                                }
                            />
                        );
                    })}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
