
#!/bin/bash

echo "🔄 Starting modular restructure..."

# Create backend directory structure
echo "📁 Creating backend structure..."
mkdir -p backend/src/{config,middleware,routes,schemas,services}

# Create frontend directory structure
echo "📁 Creating frontend structure..."
mkdir -p frontend/src/{components,pages,services,config,hooks,lib,contexts}

# Copy shared schema to backend
echo "📋 Migrating schemas..."
cp shared/schema.ts backend/src/schemas/index.ts

# Copy server files to backend
echo "📋 Migrating backend files..."
cp server/*.ts backend/src/ 2>/dev/null || true

# Copy client files to frontend
echo "📋 Migrating frontend files..."
cp -r client/src/* frontend/src/ 2>/dev/null || true
cp client/index.html frontend/ 2>/dev/null || true

echo "✅ Directory structure created!"
echo ""
echo "Next steps:"
echo "1. cd backend && npm install"
echo "2. Configure backend/.env with Supabase credentials"
echo "3. cd ../frontend && npm install"
echo "4. Configure frontend/.env with backend API URL"
echo "5. Run backend: cd backend && npm run dev"
echo "6. Run frontend: cd frontend && npm run dev"
