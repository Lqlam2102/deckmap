import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@mui/material';
import Copyright from '~/components/Copyright';
import images from '~/assets/image';

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function ForgotPassword() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const SnackbarSubmit = (mess) => {
        const action = (key) => (
            <IconButton size="small" aria-label="close" color="inherit" onClick={() => closeSnackbar(key)}>
                <FontAwesomeIcon icon={faXmark} beat />
            </IconButton>
        );
        if (mess === 'success') {
            enqueueSnackbar('Gửi mã thành công!', { variant: 'success', action });
        } else {
            enqueueSnackbar('Không được để trống thông tin!', { variant: 'error', action });
        }
    };

    const navigate = useNavigate();
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        let email = data.get('email');
        if (email) {
            SnackbarSubmit('success');
        } else {
            SnackbarSubmit('null');
        }
        // navigate('/');
    };
    const handleSignUp = (event) => {
        event.preventDefault();
        navigate('/signup');
    };
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
                    <Avatar sx={{ m: 1, width: '70px', height: '70px' }}>
                        <img style={{ width: '100%' }} alt="logo" src={images['vnuf']} />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Quên mật khẩu
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                            Gửi mã xác minh
                        </Button>
                        <Grid container>
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
