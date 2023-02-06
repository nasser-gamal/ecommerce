const Order = require("../../models/order");
const Excel = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const getOrders = async (req, res) => {
  try {
    const orderPerPage = 1;
    const page = +req.query.page || 1;
    const totalItems = await Order.find().countDocuments();

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("products.productId")
      .skip(orderPerPage * (page - 1))
      .limit(orderPerPage);

    return res.render("admin/orders", {
      pageTitle: "Users",
      cssFile: "admin/orders.css",
      orders,
      path: "/orders",
      totalItems,
      hasNextPage: orderPerPage * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      currentPage: page,
      lastPage: Math.ceil(totalItems / orderPerPage),
      pagenation: totalItems > orderPerPage,
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const exportOrderExcel = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("products.productId");

    if (!order) {
      return res.redirect("/401");
    }
    console.log(order);

    const workbook = new Excel.Workbook();

    const worksheet = workbook.addWorksheet("sheet 1");

    worksheet.getColumn(1).alignment = { horizontal: "center" };

    // center rows
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.columns = [
      { header: "OrderId", key: "id", width: "30" },
      { header: "Name", key: "name", width: "30" },
      { header: "Address", key: "address", width: "30" },
      { header: "Products", key: "products", width: "30" },
      { header: "Quantity", key: "quantity", width: "30" },
      { header: "totalPrice", key: "price", width: "30" },
      { header: "createdAt", key: "date", width: "30" },
    ];

    const date = order.createdAt;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours =
      date.getHours() > 12 ? date.getHours() - 12 : `${date.getHours()}`;
    const minutes =
      date.getMinutes() > 12 ? date.getMinutes() : `0${date.getMinutes()}`;
    const period = date.getHours() > 12 ? "pm" : "am";

    order.products.map((product) => {
      return worksheet.addRows([
        {
          id: order._id,
          name: order.name,
          address: order.address,
          products: product.productId.title,
          quantity: order.totalQuantity,
          price: order.totalPrice,
          date: `${day} / ${month} / ${year} --- ${hours}:${minutes} ${period}`,
        },
      ]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + `order-${order.name}.xlsx`
    );

    workbook.xlsx.write(res).then(function () {
      res.end();
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

const exportOrderPDF = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("products.productId");
    if (!order) {
      return res.redirect("/404");
    }

    // Define the invoice information
    const logo = "SHOP";
    const name = order.name;
    const address = order.address;
    const mobile = order.contactNumber;
    const date = new Date().toDateString();

    const products = [];

    console.log(order);
    order.products.map((product) => {
      return products.push({
        title: product.productId.title,
        quantity: product.quantity,
        price: product.totalPrice,
        brand: product.productId.description.brand,
        color: product.productId.description.color,
      });
    });

    const discount = 0;
    const totalPrice = order.totalPrice;

    const doc = new PDFDocument();

    // logo
    doc.fontSize(16).text(logo, 50, 50, { width: 50 });

    // order information
    doc.fontSize(16).text(name, 400, 50);
    doc.fontSize(16).text(address, 400, 70);
    doc.fontSize(16).text(mobile, 400, 90);
    doc.fontSize(16).text(date, 400, 105);

    // Add a table for the products
    doc.fontSize(16).text("Name", 50, 250);
    doc.fontSize(16).text("Brand", 200, 250);
    doc.fontSize(16).text("Color", 350, 250);
    doc.fontSize(16).text("Quantity", 450, 250);
    doc.fontSize(16).text("Price", 550, 250);

    products.forEach((product, i) => {
      doc.fontSize(16).text(product.title, 50, 270 + i * 32);
      doc.fontSize(16).text(product.brand, 200, 270 + i * 30);
      doc.fontSize(16).text(product.color, 350, 270 + i * 30);
      doc.fontSize(16).text(product.quantity, 450, 270 + i * 30);
      doc.fontSize(16).text(product.price, 550, 270 + i * 30);
    });

    // Add the discount and total price
    doc.fontSize(18).text(`Discount: ${discount}`, 380, 440);
    doc.fontSize(18).text(`Total Price: ${totalPrice}`, 380, 470);

    doc.pipe(res);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Dispostion",
      'inline; filename="' + `invoice-${order.name}.pdf` + '"'
    );
    // End the PDF
    doc.end();
  } catch (err) {
    console.log(err);
    return res.redirect("/500");
  }
};

module.exports = {
  getOrders,
  exportOrderExcel,
  exportOrderPDF,
};
