import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faXmark } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@mui/material';
import Copyright from '~/components/Copyright';
import Apis, { endpoints } from '~/configs/Apis';
import cookies from 'react-cookies';
import { useDispatch } from 'react-redux';
import { loginUser } from '~/ActionCreators/UserCreator';
import { useLocation } from 'react-router';
import store from '~/reducers/Store';

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function SignIn() {
    const navigate = useNavigate();
    const [loadingLogin, setLoadingLogin] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        const state = store.getState();
        if (state.user?.user?.id) {
            navigate('/');
        } else {
            setIsLoading(false);
        }
    }, [navigate]);
    const location = useLocation();
    const dispatch = useDispatch();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const SnackbarSubmit = (mess) => {
        const action = (key) => (
            <IconButton size="small" aria-label="close" color="inherit" onClick={() => closeSnackbar(key)}>
                <FontAwesomeIcon icon={faXmark} beat />
            </IconButton>
        );
        if (mess === 'login_success') {
            enqueueSnackbar('Đăng nhập thành công!', { variant: 'success', action });
        } else {
            enqueueSnackbar('Đăng nhập thất bại!', { variant: 'error', action });
        }
    };
    let pathContinue = location.search.split('?continue=')[1];

    if (pathContinue === '/signup' || pathContinue === undefined) {
        pathContinue = '/';
    }
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setLoadingLogin(true);
        try {
            let res = await Apis.post(endpoints['login'], data);
            cookies.save('access_token', res.data.access_token);
            let user = await Apis.get(endpoints['current-user'], {
                headers: {
                    Authorization: `Bearer ${cookies.load('access_token')}`,
                },
            });
            cookies.save('user', user.data);
            dispatch(loginUser(user.data));
            SnackbarSubmit('login_success');
            // navigate(pathContinue);
        } catch (err) {
            SnackbarSubmit('error');
            console.log(err.message);
        }
        setLoadingLogin(false);
        // SnackbarSubmit('login_success');
    };
    const forgotPassword = (event) => {
        event.preventDefault();
        navigate('/forgot');
    };
    const handleSignUp = (event) => {
        event.preventDefault();
        navigate('/signup');
    };
    if (isLoading) {
        return (
            <FontAwesomeIcon
                icon={faSpinner}
                spin
                size="2xl"
                style={{ color: '#2f3642', top: '50%', left: '50%', position: 'absolute' }}
            />
        );
    } else {
        return (
            <ThemeProvider theme={defaultTheme}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'var(--primary)' }}>
                            <LockOutlinedIcon sx={{}} />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Đăng nhập
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Mật khẩu"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" />}
                                label="Lưu mật khẩu"
                            />
                            {loadingLogin ? (
                                <Button type="submit" fullWidth disabled variant="contained" sx={{ mt: 3, mb: 2 }}>
                                    Đăng nhập
                                </Button>
                            ) : (
                                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                                    Đăng nhập
                                </Button>
                            )}
                            <Grid container>
                                <Grid item xs>
                                    <Link href="#" variant="body2" onClick={forgotPassword}>
                                        Quên mật khẩu?
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link href="#" variant="body2" onClick={handleSignUp}>
                                        {'Bạn chưa có tài khoản? Đăng ký ngay.'}
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <Copyright sx={{ mt: 8, mb: 4 }} />
                </Container>
            </ThemeProvider>
        );
    }
}
