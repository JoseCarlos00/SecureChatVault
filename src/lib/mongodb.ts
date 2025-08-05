import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import { config } from '../config/config';

if (!config.MONGODB_URI) {
	throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const client = new MongoClient(config.MONGODB_URI, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

let dbInstance: Db;

export async function connectToDatabase() {
	try {
		await client.connect();
		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		dbInstance = client.db(); // The DB name is taken from the connection string
		console.log('Pinged your deployment. You successfully connected to MongoDB!');
	} catch (error) {
		console.error('Could not connect to MongoDB', error);
		// Exit the process if the DB connection fails on startup
		process.exit(1);
	}
}

export const getDb = (): Db => {
	if (!dbInstance) {
		throw new Error('Database not initialized. Make sure connectToDatabase() is called on server start.');
	}
	return dbInstance;
};


