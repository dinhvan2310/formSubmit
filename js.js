// Doi tuong validator

function Validator(options) {
  var selectorRules = {};

  // Ham thuc hien validate
  function validate(inputElement, rule) {
    var errorMessage;
    var errorElement = inputElement.parentElement.querySelector(
      options.errorSelector
    );

    //Lay ra cac rule cua selector
    var rules = selectorRules[rule.selector];

    for (var i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.parentElement.classList.add("invalid");
    } else {
      errorElement.innerText = "";
      inputElement.parentElement.classList.remove("invalid");
    }

    return !errorMessage;
  }

  //Lay element cua form can validate
  let formElement = document.querySelector(options.form);
  if (formElement) {
    //Khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      //Thuc hien lap qua tung rule va validate
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        //Truong hop submit voi Js
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );

          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            return (values[input.name] = input.value) && values;
          },
          {});

          options.onSubmit(formValues);
        }
        //Truong hop submit voi hanh vi mac dinh
        else {
          formElement.submit();
        }
      }
    };

    //Lap qua moi rule va xu ly (lang nghe su kien blur, input,...)
    options.rules.forEach(function (rule) {
      //Luu lai cac rules cho moi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElement = formElement.querySelector(rule.selector);
      if (inputElement) {
        // Xu ly truong hop blur khoi input
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };

        //Xu ly moi khi nguoi dung nhap vao input
        inputElement.oninput = function () {
          var errorElement = inputElement.parentElement.querySelector(
            options.errorSelector
          );
          errorElement.innerText = "";
          inputElement.parentElement.classList.remove("invalid");
        };
      }
    });
  }
}
// Dinh nghia rules
// Nguyen tac cua cac rules:
// 1. Khi co loi => tra ra message loi
// 2. Khi hop le => tra ra undefine
Validator.isRequired = function (selector, message) {
  return {
    selector,
    test: function (value) {
      return value.trim() ? undefined : message || "Vui long nhap truong nay";
    }
  };
};

Validator.isEmail = function (selector) {
  return {
    selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : "Truong nay phai la email";
    }
  };
};

Validator.minLength = function (selector, min) {
  return {
    selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : `Vui long nhap toi thieu ${min} ki tu`;
    }
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Gia tri nhap vao khong chinh xac";
    }
  };
};

Validator({
  form: "#form-1",
  errorSelector: ".form-message",
  rules: [
    Validator.isRequired("#fullname", "Vui long nhap ten day du cua ban"),
    Validator.isRequired("#email"),
    Validator.isEmail("#email"),
    Validator.minLength("#password", 6),
    Validator.isRequired("#password_confirmation"),
    Validator.isConfirmed(
      "#password_confirmation",
      function () {
        return document.querySelector("#form-1 #password").value;
      },
      "Mat khau nhap lai khong chinh xac"
    )
  ],
  onSubmit: function (data) {
    //call API
    console.log(data);
  }
});
