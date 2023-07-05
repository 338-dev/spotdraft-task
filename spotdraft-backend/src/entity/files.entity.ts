import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class FileEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  url: string;

  @Column()
  name: string;

  @Column()
  size: string;

  @Column()
  lastModified: string;

  @Column()
  owner: number;

  @Column({ nullable: true, default: null })
  sharedWith: string;

  @Column()
  securedUuid: string;

  @Column({ default: false })
  shareWithAllAuthenticated: boolean;

  @Column({ default: false })
  shareWithEveryOne: boolean;

  @Column({ nullable: true, default: null })
  comments: string;

  toJSON() {
    return {
      id: this.id,
      url: this.url,
      owner: this.owner,
      sharedWith: this.sharedWith,
      size: this.size,
      name: this.name,
      lastModified: this.lastModified,
      securedUuid: this.securedUuid,
      shareWithAllAuthenticated: this.shareWithAllAuthenticated,
      shareWithEveryOne: this.shareWithEveryOne,
      comments: this.comments,
    };
  }
}
