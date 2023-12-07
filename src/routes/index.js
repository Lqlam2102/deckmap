import Home from '~/pages/Home';
import NotFound from '~/pages/NotFound';
import SignIn from '~/pages/SignIn';
import SignUp from '~/pages/SignUp';
import ForgotPassword from '~/pages/ForgotPassword';

const publicRoutes = [
    { path: '/', component: Home },
    { path: '/signin', component: SignIn, layout: null },
    { path: '/signup', component: SignUp, layout: null },
    { path: '/forgot', component: ForgotPassword, layout: null },
    { path: '*', component: NotFound, layout: null },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };