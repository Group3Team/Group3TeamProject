#!/bin/bash
set -e



# Create frontend
npm create vite@latest frontend -- --template react
(cd frontend && npm install)

echo "*** create vite/react and npm install ***"


# install frontend dependencies

npm install @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event

echo "***React app created successfully***"

