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
import { faCamera, faXmark } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@mui/material';
import Copyright from '~/components/Copyright';
import store from '~/reducers/Store';
import { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './SignUp.module.scss';
import Apis, { endpoints } from '~/configs/Apis';
import images from '~/assets/image';

// TODO remove, this demo shouldn't need to reset the theme.

const cx = classNames.bind(styles);

const defaultTheme = createTheme();

export default function SignUp() {
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState();
    React.useEffect(() => {
        const state = store.getState();
        if (state.user?.user?.id) {
            navigate('/deckmap');
        }
    }, [navigate]);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const SnackbarSubmit = (mess) => {
        const action = (key) => (
            <IconButton size="small" aria-label="close" color="inherit" onClick={() => closeSnackbar(key)}>
                <FontAwesomeIcon icon={faXmark} beat />
            </IconButton>
        );
        if (mess === 'success') {
            enqueueSnackbar('Đăng ký thành công!', { variant: 'success', action });
        } else if (mess === 'null') {
            enqueueSnackbar('Không được để trống thông tin!', { variant: 'error', action });
        } else {
            enqueueSnackbar(`${mess}`, { variant: 'error', action });
        }
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        let email = data.get('email');
        let password = data.get('password');
        let allowExtraEmails = data.get('allowExtraEmails');
        if (avatar) {
            data.append('photo', avatar, avatar.name);
        }

        if (email && password && allowExtraEmails) {
            try {
                let res = await Apis.post(endpoints['register'], data);
                // cookies.save('access_token', res.data.access_token);
                // let user = await Apis.get(endpoints['current-user'], {
                //     headers: {
                //         Authorization: `Bearer ${cookies.load('access_token')}`,
                //     },
                // });
                // cookies.save('user', user.data);
                // dispatch(loginUser(user.data));
                console.log(res);
                SnackbarSubmit('success');
                // navigate(pathContinue);
            } catch (err) {
                if (err.response.data?.username) {
                    SnackbarSubmit('Tài khoản đã tồn tại');
                } else {
                    SnackbarSubmit(err.response.data?.message);
                }
                console.log(err);
            }
        } else {
            SnackbarSubmit('null');
        }
    };
    const handleSignIn = (event) => {
        event.preventDefault();
        navigate('/signin');
    };
    const handlePreviewAvatar = (e) => {
        const file = e.target.files[0];
        file.preview = URL.createObjectURL(file);
        setAvatar(file);
        console.log(file);
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
                        Đăng ký
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="given-name"
                                    name="first_name"
                                    required
                                    fullWidth
                                    id="first_name"
                                    label="Họ đệm"
                                    autoFocus
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="last_name"
                                    label="Tên"
                                    name="last_name"
                                    autoComplete="family-name"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    autoComplete="username-register"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                />
                            </Grid>
                            <Grid item xs={12} style={{ marginBottom: '-10px' }}>
                                <label>Hình đại diện</label>
                                {/* <input type="file" onChange={handlePreviewAvatar} /> */}

                                {avatar ? (
                                    <img id={cx('uploaded_view')} src={avatar.preview} alt="avatar" />
                                ) : (
                                    <img
                                        id={cx('uploaded_view')}
                                        src={
                                            'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1280px-Image_created_with_a_mobile_phone.png'
                                        }
                                        alt="avatar"
                                    />
                                )}
                                <div className={cx('btn_upload')}>
                                    <input
                                        type="file"
                                        id="upload_file"
                                        name=""
                                        onChange={handlePreviewAvatar}
                                        accept="image/*"
                                    />
                                    <FontAwesomeIcon icon={faCamera} id={cx('icon-avatar')} />
                                </div>
                            </Grid>
                        </Grid>
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                            Đăng ký
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="#" variant="body2" onClick={handleSignIn}>
                                    Bạn đã có tài khoản? Đăng nhập ngay.
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Copyright sx={{ mt: 5 }} />
            </Container>
        </ThemeProvider>
    );
}
