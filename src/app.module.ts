import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { softDeletePlugin } from '../node_modules/soft-delete-plugin-mongoose/dist/src/soft-delete-plugin';
import { CompaniesModule } from './companies/companies.module';

@Module({
  imports: [
    // MongooseModule.forRoot('mongodb+srv://tathan:zt4g9RbEeiPSJbGm@cluster0.zc1wqzm.mongodb.net/'),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        }
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    CompaniesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
