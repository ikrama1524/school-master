
#!/bin/bash
echo "Installing dependencies..."
npm install

echo "Pushing database schema..."
npm run db:push

echo "Database initialized successfully!"
