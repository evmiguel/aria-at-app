// auth.state
export const authState = {
    // calculated booleans
    isAdmin: false,
    isTester: false,
    isSignedIn: false,
    isSignInFailed: false,
    isSignOutCalled: false,

    // user object values
    id: null,
    roles: [],
    username: null
};

// auth.action.types
export const SIGN_IN = 'SIGN_IN';
export const SIGN_OUT = 'SIGN_OUT';
export const SIGN_IN_FAIL = 'SIGN_IN_FAIL';

// auth.actions
export const signIn = payload => ({
    type: SIGN_IN,
    payload
});

export const signOut = () => ({
    type: SIGN_OUT
});

export const signInFail = () => ({
    type: SIGN_IN_FAIL
});
