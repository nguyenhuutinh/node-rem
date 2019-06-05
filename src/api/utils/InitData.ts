export {};
import { User, UserNote, ImportProduct, SaleProduct, SaleOrder, ImportOrder, PackageTimeLine, OrderProducts, SupplierAccount} from 'api/models';
const mongoose = require('mongoose');

const SUPPLIER_1 = {
  _id:new mongoose.Types.ObjectId,
  name:'CONG TY TNHH THOUSAND HANDS',
  phone: '1900636791',
  address: '416A Hai Ba Trung',
  type: 'store',
};
const SUPPLIER_2 = {
  _id:new mongoose.Types.ObjectId,
  name:'CONG TY TNHH TINH NGUYEN',
  phone: '1900636792',
  address: '416A Hai Ba Trung',
  type: 'supplier',
};

// const IMPORT_PRODUCT_2 = {
//   _id:new mongoose.Types.ObjectId,
//   prd_code:'153170',
//   name: 'LE DO XANH ( XX NAM PHI)',
//   image: 'admin',
//   dvt: 'kg',
//   note:'KO THE LAY LE HAN QUOC'
// };

// const SALE_PRODUCT_1 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'vdts325',
//   name: 'Vẻ đẹp tỏa sáng 325',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/24/3ffa4cf0ccb7a6c18a137b64958beb37/product_thumb3ebb1cf3c49e686fa61c9519f754fc20.?1532416337',
//   price:'55000',
//   type:'325ml',
//   note:''
// };

// const SALE_PRODUCT_2 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'vdts500',
//   name: 'Vẻ đẹp tỏa sáng 500',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/24/3ffa4cf0ccb7a6c18a137b64958beb37/product_thumb3ebb1cf3c49e686fa61c9519f754fc20.?1532416337',
//   price:'75000',
//   type:'500ml',
//   note:''
// };
// const SALE_PRODUCT_3 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'tdtd325',
//   name: 'Thải độc thần dược 325',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/24/e4abcc046c50387bf2218d64ecc26f10/product_thumb12dfec182cb8b49dfed0a6d732cfd919.?1536291437',
//   price:'55000',
//   type:'325ml',
//   note:''
// };
// const SALE_PRODUCT_4 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'tdtd500',
//   name: 'Thải độc thần dược 500',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/24/e4abcc046c50387bf2218d64ecc26f10/product_thumb12dfec182cb8b49dfed0a6d732cfd919.?1536291437',
//   price:'70000',
//   type:'500ml',
//   note:''
// };

//
// const SALE_PRODUCT_5 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'vdhm325',
//   name: 'Vóc dáng hoàn mỹ 325',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/24/4a79d73a5d27fa03c56d23e3f2ca3395/product_thumb45d53c645a3cffee337a6912689da1f7.?1532417685',
//   price:'70000',
//   type:'325ml',
//   note:''
// };
// const SALE_PRODUCT_6 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'vdhm500',
//   name: 'Vóc dáng hoàn mỹ 500',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/24/4a79d73a5d27fa03c56d23e3f2ca3395/product_thumb45d53c645a3cffee337a6912689da1f7.?1532417685',
//   price:'100000',
//   type:'500ml',
//   note:''
// };


// const SALE_PRODUCT_7 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'dsds325',
//   name: 'Da sáng dáng son 325',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/24/2a4384964e8b988ffc8ab5341231c8fe/product_thumbbaa447c5c1a3e06cc05fb14cfeb74fcd.?1536291475',
//   price:'60000',
//   type:'325ml',
//   note:''
// };
// const SALE_PRODUCT_8 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'dsds500',
//   name: 'Da sáng dáng son 500',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/24/2a4384964e8b988ffc8ab5341231c8fe/product_thumbbaa447c5c1a3e06cc05fb14cfeb74fcd.?1536291475',
//   price:'80000',
//   type:'500ml',
//   note:''
// };
//
//
//
// const SALE_PRODUCT_9 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'kpnl325',
//   name: 'Khôi phục năng lượng 325',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/23/5cb9e415175ddb1a259a2bcffd047a36/product_thumb5dc5ed55ff3289e9e06f40b75d1fee78.?1532405876',
//   price:'60000',
//   type:'325ml',
//   note:''
// };
// const SALE_PRODUCT_10 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'kpnl500',
//   name: 'Khôi phục năng lượng 500',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/23/5cb9e415175ddb1a259a2bcffd047a36/product_thumb5dc5ed55ff3289e9e06f40b75d1fee78.?1532405876',
//   price:'80000',
//   type:'500ml',
//   note:''
// };
//
// const SALE_PRODUCT_11 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'vdtt325',
//   name: 'Vẻ đẹp tươi trẻ 325',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/24/c43872641c6159e98010d89e53f02fc3/product_thumbaa2e58c6658cfdde3ebe11e1db493d56.?1532405434',
//   price:'80000',
//   type:'325ml',
//   note:''
// };
// const SALE_PRODUCT_12 = {
//   _id:new mongoose.Types.ObjectId,
//   code:'vdtt500',
//   name: 'Vẻ đẹp tươi trẻ 500',
//   image_url: 'https://d3e2huyg92vyxs.cloudfront.net/product/2018-07/24/c43872641c6159e98010d89e53f02fc3/product_thumbaa2e58c6658cfdde3ebe11e1db493d56.?1532405434',
//   price:'115000',
//   type:'500ml',
//   note:''
// };

const ADMIN_IMPORT_USER_1 = {
  email: 'ai1@thousandhands.com',
  role: 'admin_import',
  password: '123456',
  phone:'00000001',
  avatar:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQguwSGEWgYclNcRFceLDbZZydOsfj9hni-ukb0zoNWxDyX0_s4vg',
  name:'Admin Import 1'
};
const ADMIN_IMPORT_USER_2 = {
  email: 'ai2@thousandhands.com',
  role: 'admin_import',
  password: '123456',
  phone:'00000002',
  avatar:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQguwSGEWgYclNcRFceLDbZZydOsfj9hni-ukb0zoNWxDyX0_s4vg',
  name:'Admin Import 2'
};


const ADMIN_OP_USER_1 = {
  email: 'ap1@thousandhands.com',
  role: 'admin_op',
  password: '123456',
  phone:'00000003',
  avatar:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQguwSGEWgYclNcRFceLDbZZydOsfj9hni-ukb0zoNWxDyX0_s4vg',
  name:'Admin OP 1'
};
const ADMIN_OP_USER_2 = {
  email: 'ap2@thousandhands.com',
  role: 'admin_op',
  phone:'00000004',
  password: '123456',
  avatar:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQguwSGEWgYclNcRFceLDbZZydOsfj9hni-ukb0zoNWxDyX0_s4vg',
  name:'Admin OP 2'
};

const ADMIN_SUPER_USER_1 = {
  email: 'admin@thousandhands.com',
  role: 'admin_super',
  password: '123456',
  phone:'00000005',
  avatar:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQguwSGEWgYclNcRFceLDbZZydOsfj9hni-ukb0zoNWxDyX0_s4vg',
  name:'Admin Super'
};

const CUSTOMER_USER_1 = {
  email: 'c1@thousandhands.com',
  role: 'user_customer',
  phone:'1900636791',
  password: '123456',
  address:'416A Hai Ba Trung' ,
  avatar:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQguwSGEWgYclNcRFceLDbZZydOsfj9hni-ukb0zoNWxDyX0_s4vg',
  name:'CONG TY TNHH THOUSAND HANDS'
};
// const CUSTOMER_USER_2 = {
//   email: 'c2@thousandhands.com',
//   role: 'user_customer',
//   phone:'0932383422',
//   password: '123456',
//   address:'123 Tran Quang Dieu Phuong 4 Quan 3',
//   avatar:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQguwSGEWgYclNcRFceLDbZZydOsfj9hni-ukb0zoNWxDyX0_s4vg',
//   name:'User 2'
// };

async function setup() {
  // const importProduct1 = new ImportProduct(IMPORT_PRODUCT_1);
  // await importProduct1.save();
  //
  // const importProduct2 = new ImportProduct(IMPORT_PRODUCT_2);
  // await importProduct2.save();

  // const saleProduct1 = new SaleProduct(SALE_PRODUCT_1);
  // await saleProduct1.save();

  // const saleProduct2 = new SaleProduct(SALE_PRODUCT_2);
  // await saleProduct2.save();

  // const saleProduct3 = new SaleProduct(SALE_PRODUCT_3);
  // await saleProduct3.save();
  //
  // const saleProduct4 = new SaleProduct(SALE_PRODUCT_4);
  // await saleProduct4.save();
  //
  //
  // const saleProduct5 = new SaleProduct(SALE_PRODUCT_5);
  // await saleProduct5.save();
  //
  // const saleProduct6 = new SaleProduct(SALE_PRODUCT_6);
  // await saleProduct6.save();
  //
  //
  // const saleProduct7 = new SaleProduct(SALE_PRODUCT_7);
  // await saleProduct7.save();
  //
  // const saleProduct8 = new SaleProduct(SALE_PRODUCT_8);
  // await saleProduct8.save();
  //
  //
  //
  //
  // const saleProduct9 = new SaleProduct(SALE_PRODUCT_9);
  // await saleProduct9.save();
  //
  // const saleProduct10 = new SaleProduct(SALE_PRODUCT_10);
  // await saleProduct10.save();
  //
  //
  //
  // const saleProduct11 = new SaleProduct(SALE_PRODUCT_11);
  // await saleProduct11.save();
  //
  // const saleProduct12 = new SaleProduct(SALE_PRODUCT_12);
  // await saleProduct12.save();

  const adminUser1 = new User(ADMIN_IMPORT_USER_1);
  await adminUser1.save();


  const adminUser2 = new User(ADMIN_IMPORT_USER_2);
  await adminUser2.save();

  const adminUser3 = new User(ADMIN_OP_USER_1);
  await adminUser3.save();

  const adminUser4 = new User(ADMIN_OP_USER_2);
  await adminUser4.save();

  const customer1 = new User(CUSTOMER_USER_1);
  await customer1.save();
  //
  // const customer2 = new User(CUSTOMER_USER_2);
  // await customer2.save();

  const superAdmin = new User(ADMIN_SUPER_USER_1);
  await superAdmin.save();

  const supplier1 = new SupplierAccount(SUPPLIER_1);
  await supplier1.save();
  const supplier2 = new SupplierAccount(SUPPLIER_2);
  await supplier2.save();
  // const importOrder1 = new ImportOrder({_id:new mongoose.Types.ObjectId,order_code:"import order1", customer: adminUser1._id, delivery_address:"13 lam son", delivery_time: new Date(), note:"", productIDs: [importProduct1._id,importProduct2._id]})
  // await importOrder1.save();
  //
  // const importOrder2 = new ImportOrder({_id:new mongoose.Types.ObjectId,order_code:"import order2", customer: adminUser1._id, delivery_address:"12 lam son", delivery_time: new Date(), note:"", productIDs: [importProduct2._id, importProduct1._id]})
  // await importOrder2.save();
  //
  //
  //
  // const prdQuatity1 = new ProductQuantity({id:new mongoose.Types.ObjectId, product: saleProduct7._id, quantity: 12})
  // await prdQuatity1.save()
  //
  //
  // const prdQuatity2 = new ProductQuantity({id:new mongoose.Types.ObjectId, product: saleProduct12._id, quantity: 2})
  // await prdQuatity2.save()
  //
  //
  // var deliveryTime = new PackageTimeLine({_id:new mongoose.Types.ObjectId, delivery_no: 1, delivery_time: new Date(), delivery_status: 'new',deliverier:'tao' });
  // await deliveryTime.save()
  // const saleOrder1 = new SaleOrder({_id:new mongoose.Types.ObjectId, code:"sale order1", customer: customer1._id, delivery_address:"13 lam son", delivery_time: deliveryTime._id, note:"", products: [prdQuatity1, prdQuatity2]})
  // await saleOrder1.save();
}

async function checkNewDB() {
  const adminUser1 = await User.findOne({ email: ADMIN_IMPORT_USER_1.email });
  if (!adminUser1) {
    console.log('- New DB detected ===> Initializing Dev Data...');
    await setup();
  } else {
    console.log('- Skip InitData');
  }
}

checkNewDB();
