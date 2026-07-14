import { IsLatitude, IsLongitude, IsUrl } from 'class-validator';

export class CreateObservationDto {
  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsUrl()
  imageUrl!: string;
}
