import React, { useEffect } from "react";
import $ from "jquery";

const TranslateButton = ({
  handleUpload,
  isUploading,
  file,
  originalLanguage,
  targetLanguage,
  progress,
}) => {
  useEffect(() => {
    $(".translate-button").on("click", (e) => {
      let btn = $(e.currentTarget),
        label = btn.find(".label"),
        counter = label.find(".counter");

      if (!btn.hasClass("active") && !btn.hasClass("done")) {
        btn.addClass("active");

        setLabel(label, label.find(".default"), label.find(".state"));

        setTimeout(() => {
          counter.addClass("hide");
          counter.animate(
            {
              width: 0,
            },
            400,
            function () {
              label.width(label.find(".state > span").width());
              counter.removeAttr("style");
            }
          );
          btn.removeClass("active").addClass("done");
        }, getComputedStyle(btn[0]).getPropertyValue("--duration"));
      }

      return false;
    });

    $(".restart").on("click", (e) => {
      let btn = $(".translate-button"),
        label = btn.find(".label"),
        counter = label.find(".counter");

      setLabel(
        label,
        label.find(".state"),
        label.find(".default"),
        function () {
          counter.removeClass("hide");
          btn.removeClass("done");
        }
      );

      return false;
    });

    function setLabel(div, oldD, newD, callback) {
      oldD.addClass("hide");
      div.animate(
        {
          width: newD.outerWidth(),
        },
        200,
        function () {
          oldD.removeClass("show hide");
          newD.addClass("show");
          div.removeAttr("style");
          if (typeof callback === "function") {
            callback();
          }
        }
      );
    }
  }, []);

  return (
    <div>
      <button
        className="translate-button"
        onClick={handleUpload}
        disabled={isUploading || !file || !originalLanguage || !targetLanguage}
      >
        Translate
      </button>
      <p>Progress: {progress}%</p>
    </div>
  );
};

export default TranslateButton;
