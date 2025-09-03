import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose/dist/src/soft-delete-model';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(@InjectModel(Resume.name) private resumeModel: SoftDeleteModel<ResumeDocument>) { }
  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const { url, companyId, jobId } = createUserCvDto;
    const { email, _id } = user;
    const resume = await this.resumeModel.create({
      url,
      companyId,
      jobId,
      email: email,
      userId: _id,
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          changedAt: new Date(),
          updatedBy: {
            _id: _id,
            email: email
          }
        }
      ],
      createdBy: {
        _id: _id,
        email: email
      }
    });
    return {
      _id: resume?._id,
      createdAt: resume?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * (+limit);
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại 
        pageSize: limit, //số lượng bản ghi đã lấy 
        pages: totalPages,  //tổng số trang với điều kiện query 
        total: totalItems // tổng số phần tử (số bản ghi) 
      },
      result //kết quả query 
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Not found resume with id ${id}`);
    return await this.resumeModel.findOne({ _id: id });
  }

  async update(id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Not found resume with id ${id}`);
    return await this.resumeModel.updateOne({ _id: id }, {
      status: status,
      updatedBy: {
        _id: user._id,
        email: user.email,
      },
      $push: {
        history: {
          status: status,
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            email: user.email,
          }
        }
      }
    })
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException(`Not found resume with id ${id}`);
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          id: user._id,
          email: user.email
        }
      })
    return this.resumeModel.softDelete({
      _id: id
    })
  }

  async findByUsers(user: IUser) {
    return await this.resumeModel.find({ userId: user._id })
      .sort("-createdAt")
      .populate([
        {
          path: "companyId",
          select: { name: 1 }
        },
        {
          path: "jobId",
          select: { name: 1 }
        }
      ]);
  }
}
