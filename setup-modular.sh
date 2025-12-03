
#!/bin/bash

echo "Setting up modular structure..."

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd ../backend
npm install

echo "Setup complete!"
echo ""
echo "To run the application:"
echo "1. Terminal 1 - Backend: cd backend && npm run dev"
echo "2. Terminal 2 - Frontend: cd frontend && npm run dev"
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo "Backend API will be available at: http://localhost:3000"
