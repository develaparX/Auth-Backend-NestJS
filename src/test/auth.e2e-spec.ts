import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let connection: Connection;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AppModule,
                // Use a separate in-memory MongoDB for testing, or a test database
                // For actual e2e, connecting to the real DB via MONGO_URI is fine
                MongooseModule.forRoot('mongodb://127.0.0.1:27017/test_youapp_db'),
                MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Get the Mongoose connection to clear the database before each test
        connection = moduleFixture.get<Connection>(getConnectionToken());
        // Add non-null assertion operator (!) because we expect connection.db to be defined in tests
        await connection.db!.dropDatabase(); // Clear the database
    });

    afterEach(async () => {
        // Add non-null assertion operator (!) because we expect connection.db to be defined in tests
        await connection.db!.dropDatabase(); // Clear database after each test
        await app.close();
    });

    it('/api/auth/register (POST) - should register a user successfully', () => {
        return request(app.getHttpServer())
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Password123!',
            })
            .expect(201)
            .expect({ message: 'User registered successfully' });
    });

    it('/api/auth/register (POST) - should return 409 if email already exists', async () => {
        await request(app.getHttpServer())
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Password123!',
            })
            .expect(201);

        return request(app.getHttpServer())
            .post('/api/auth/register')
            .send({
                email: 'test@example.com',
                password: 'Password123!',
            })
            .expect(409)
            .expect({
                statusCode: 409,
                message: 'Email already exists',
                error: 'Conflict',
            });
    });

    it('/api/auth/login (POST) - should log in a user and return a token', async () => {
        await request(app.getHttpServer())
            .post('/api/auth/register')
            .send({
                email: 'login@example.com',
                password: 'Password123!',
            })
            .expect(201);

        const response = await request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                email: 'login@example.com',
                password: 'Password123!',
            })
            .expect(200);

        expect(response.body).toHaveProperty('accessToken');
        expect(typeof response.body.accessToken).toBe('string');
    });

    it('/api/auth/login (POST) - should return 401 for invalid credentials', async () => {
        await request(app.getHttpServer())
            .post('/api/auth/register')
            .send({
                email: 'wrong@example.com',
                password: 'Password123!',
            })
            .expect(201);

        return request(app.getHttpServer())
            .post('/api/auth/login')
            .send({
                email: 'wrong@example.com',
                password: 'WrongPassword!',
            })
            .expect(401)
            .expect({
                statusCode: 401,
                message: 'Invalid credentials',
                error: 'Unauthorized',
            });
    });
});
