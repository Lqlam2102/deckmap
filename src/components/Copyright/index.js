import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://fb.com/lqlam.21">
                Le Quy Lam {new Date().getFullYear()}
                {'.'}
            </Link>
        </Typography>
    );
}
export default Copyright;
