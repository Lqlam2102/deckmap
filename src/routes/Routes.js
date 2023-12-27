import Home from '~/pages/Home';
import NotFound from '~/pages/NotFound';
import SignIn from '~/pages/SignIn';
import SignUp from '~/pages/SignUp';
import ForgotPassword from '~/pages/ForgotPassword';
import DeckMap from '~/pages/DeckMap';
import UploadLayer from '~/pages/UploadLayer';
// import { LayoutOnlyHeader } from '~/Layout';
// import { DefaultLayout } from './Layout';

const publicRoutes = [
    { path: '/', component: Home, layout: null },
    { path: '/signin', component: SignIn, layout: null },
    { path: '/signup', component: SignUp, layout: null },
    { path: '/forgot', component: ForgotPassword, layout: null },
    { path: '/deckmap', component: DeckMap, layout: null },
    { path: '/upload', component: UploadLayer, layout: null },
    { path: '*', component: NotFound, layout: null },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
