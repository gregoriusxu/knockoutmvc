using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Threading;
using System.Linq.Expressions;

namespace MvcApp.Controllers
{
    public class HomeController : Controller
    {
        public const int PageSize = 2;

        private static List<Contact> contacts = new List<Contact>
        {
            new Contact{Id = "001", FirstName = "San", LastName = "Zhang", EmailAddress = "zhangsan@gmail.com", PhoneNo="123"},
            new Contact{Id = "002", FirstName = "Si", LastName = "Li", EmailAddress = "zhangsan@gmail.com", PhoneNo="456"},
            new Contact{Id = "003", FirstName = "Wu", LastName = "Wang", EmailAddress = "wangwu@gmail.com", PhoneNo="789"}
        };

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult GetContacts(string firstName, string lastName, string orderBy, int pageIndex=1, bool isAsc = true)
        {
            IEnumerable<Contact> result = from contact  in contacts
                         where (string.IsNullOrEmpty(firstName) || contact.FirstName.ToLower().Contains(firstName.ToLower()))
                            && (string.IsNullOrEmpty(lastName) || contact.LastName.ToLower().Contains(lastName.ToLower()))
                         select contact;
           int count = result.Count();
           int totalPages = count / PageSize + (count % PageSize > 0 ? 1 : 0);
           result = result.Sort(orderBy, isAsc).Skip((pageIndex - 1) * PageSize).Take(PageSize);
           return Json(new { Data = result.ToArray(), TotalPages = totalPages }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Add()
        {
            ViewBag.Action = "Add";
            ViewBag.OnSuccess = "viewModel.onDataAdded";
            return View("ContactPartial", new Contact { Id = Guid.NewGuid().ToString() });
        }

        [HttpPost]
        public ActionResult Add(Contact contact)
        {
            contacts.Add(contact);
            return Json(contact);
        }

        public ActionResult Update(string id)
        {
            ViewBag.Action = "Update";
            ViewBag.OnSuccess = "viewModel.onDataUpdated";
            return View("ContactPartial", contacts.First(c=>c.Id == id));
        }

        [HttpPost]
        public ActionResult Update(Contact contact)
        {
            Contact existing = contacts.First(c=>c.Id == contact.Id);
            existing.FirstName = contact.FirstName;
            existing.LastName = contact.LastName;
            existing.PhoneNo = contact.PhoneNo;
            existing.EmailAddress = contact.EmailAddress;
            return Json(contact);
        }

        public ActionResult Delete(string id)
        {
            Contact existing = contacts.First(c=>c.Id == id);
           contacts.Remove(existing);
           return Json(existing, JsonRequestBehavior.AllowGet);
        }
    }

    public static class Extensions
    {
          public static IEnumerable<TSource> Sort<TSource>(this IEnumerable<TSource> source, string propertyName, bool isAsc)
        {
            if (String.IsNullOrEmpty(propertyName))
            {
                return source;
            }

            var sourceType = typeof(TSource);
            var propertyInfo = sourceType.GetProperty(propertyName);

            var parameterExpression = Expression.Parameter(sourceType);
            var bodyExpression = Expression.Property(parameterExpression, propertyInfo);
            var selecterExpression = Expression.Lambda(bodyExpression, parameterExpression);

            var methodName = isAsc ? "OrderBy" : "OrderByDescending";
            var methodExpression = Expression.Call(typeof(Enumerable), methodName, new Type[] { sourceType, propertyInfo.PropertyType }, Expression.Constant(source), selecterExpression);
            return (IOrderedEnumerable<TSource>)methodExpression.Method.Invoke(null, new object[] { source, selecterExpression.Compile() });
        }
    }
}
