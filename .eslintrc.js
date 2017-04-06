module.exports = {
    "rules": {
        "quotes": [
            2,
            "single"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi": [
            2,
            "never"
        ],
      "promise/always-return": "error",
       "promise/no-return-wrap": "error",
       "promise/param-names": "error",
       "promise/catch-or-return": "error",
       "promise/no-native": "off",
       "promise/no-nesting": "warn",
       "promise/no-promise-in-callback": "warn",
       "promise/no-callback-in-promise": "warn",
       "promise/avoid-new": "off"
        
    },
    "env": {
        "browser": true,
        "node": true,
        "mocha": true
    },
    "extends": "eslint:recommended",
    "plugins": [
        "promise"
    ]
};