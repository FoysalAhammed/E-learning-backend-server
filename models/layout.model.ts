import { Document, Schema, model } from "mongoose";

interface FaqItem extends Document {
  question: string;
  answer: string;
}
interface Category extends Document {
  title: string;
}
interface BannerImage extends Document {
  public_id: string;
  url: string;
}
interface Layout extends Document {
  type: string;
  faq: FaqItem[];
  categories: Category[];
  banner: {
    image: BannerImage;
    title: string;
    subTitle: string;
  };
}
const faqSchema = new Schema<FaqItem>({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});
const CategorySchema = new Schema<Category>({
  title: {
    type: String,
  },
});
const BannerImageSChema = new Schema<BannerImage>({
  public_id: {
    type: String,
  },
  url: {
    type: String,
  },
});
const LayoutSchema = new Schema<Layout>({
  type: {
    type: String,
  },
  faq: [faqSchema],
  categories: [CategorySchema],
  banner: {
    image: BannerImageSChema,
    title: {
      type: String,
    },
    subTitle: {
      type: String,
    },
  },
});


const LayoutModel = model<Layout>('layout',LayoutSchema);
export default LayoutModel; 