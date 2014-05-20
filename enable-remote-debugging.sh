#!/bin/bash

# Defines two properties needs for firefoxOS remote debugging
#
# Usage:
# ./enable-remote-debugging.sh gaia_home
#

# KNOWN BUG:
# The remote port is actually ignored and it launches listening
# in 2828 (marionette port).
# So, just connect to localhost:2828 from Firefox remote debugger

# This has been tested with the v1.0.1 branch of gaia. Make
# sure you are in that branch by going to wherever you have
# gaia and running git checkout v1.0.1.
# ------------------------------------------------------------

GAIA_PATH=$1
CUSTOM_SETTINGS="${GAIA_PATH}/build/custom-settings.json"

if [[ ! -d "${GAIA_PATH}" ]] || [[ ! -d "${GAIA_PATH}/build" ]] ; then
  echo "Unknown folder ${GAIA_PATH}"
  echo ""
  echo "Usage:"
  echo "$0 gaia_home"
  echo ""
  echo "Example: $0 ~/Documents/code/gaia"
  exit 0
fi

# see https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS/Customization_with_the_.userconfig_file
# also, see http://blog.astithas.com/2012/10/debugging-firefox-os.html
cat > "${CUSTOM_SETTINGS}.new" <<EOF
{
"devtools.debugger.remote-enabled": true,
"marionette.defaultPrefs.enabled": false,
"devtools.debugger.remote-port": 7000
}
EOF

# Might consider "devtools.debugger.force-local": false,

if [ -f ${CUSTOM_SETTINGS} ] && cmp "${CUSTOM_SETTINGS}" "${CUSTOM_SETTINGS}.new" >& /dev/null; then
  rm "${CUSTOM_SETTINGS}.new"
else
  mv "${CUSTOM_SETTINGS}.new" "${CUSTOM_SETTINGS}"
fi

# Equivalent when running by hand:
#
#echo "user_pref(\"devtools.debugger.remote-enabled\", true);" >>${GAIA_PATH}/profile/prefs.js
#echo "user_pref(\"marionette.defaultPrefs.enabled\", false);" >>${GAIA_PATH}/profile/prefs.js
#echo "user_pref(\"devtools.debugger.remote-port\", 7000);" >>${GAIA_PATH}/profile/prefs.js

