import { app } from './config/app';
import { apiEnv } from './config/env';

const PORT = apiEnv.PORT;

app.listen(PORT, () => console.log(`→ Ready to work on port ${PORT}!`));
