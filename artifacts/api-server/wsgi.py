# PythonAnywhere WSGI entry point
#
# In your PythonAnywhere web app settings:
#   Source code:          /home/<username>/<repo>/artifacts/api-server
#   Working directory:    /home/<username>/<repo>/artifacts/api-server
#   WSGI configuration:   this file (or point to its path)
#
# PythonAnywhere expects a callable named "application".

import sys
import os

# Make sure Python can find the project modules
project_dir = os.path.dirname(os.path.abspath(__file__))
if project_dir not in sys.path:
    sys.path.insert(0, project_dir)

from main import app as application  # noqa: E402, F401
