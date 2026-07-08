import { IsString, IsLatitude, IsLongitude, IsUrl, MinLength } from 'class-validator';

export class CreateObservationDto {
    @IsString()
    @MinLength(2)
    species!: string;

    @IsLatitude()
    latitude!: number;

    @IsLongitude()
    longitude!: number;

    @IsUrl()
    imageUrl!: string;
}