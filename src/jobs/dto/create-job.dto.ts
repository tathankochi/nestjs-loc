import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
import mongoose from "mongoose";

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

export class CreateJobDto {
    @IsNotEmpty({ message: "Name không được để trống", })
    name: string;

    @IsNotEmpty({ message: "Skills không được để trống", })
    @IsArray({ message: "Skills phải là một mảng" })
    @IsString({ each: true, message: "Mỗi phần tử trong skills phải là một chuỗi" })
    skills: string[];

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({ message: "Salary không được để trống", })
    salary: number;

    @IsNotEmpty({ message: "Quantity không được để trống", })
    quantity: number;

    @IsNotEmpty({ message: "Level không được để trống", })
    level: string;

    @IsNotEmpty({ message: "Mô tả không được để trống", })
    description: string;

    @IsNotEmpty({ message: "startDate không được để trống", })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: "startDate phải là định dạng là Date" })
    startDate: Date;

    @IsNotEmpty({ message: "endDate không được để trống", })
    @Transform(({ value }) => new Date(value))
    @IsDate({ message: "endDate phải là định dạng là Date" })
    endDate: Date;
}
