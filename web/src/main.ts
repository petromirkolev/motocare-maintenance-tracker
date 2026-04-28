import { bindEvents } from './ui/router';
import { render } from './dom/render';
import { getCurrentUser, initState } from './state/index';

await initState();

const user = getCurrentUser();

user ? render.garageScreen() : render.initialScreen();

bindEvents();
