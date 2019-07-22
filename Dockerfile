FROM node:10.16.0

# https://github.com/TailorBrands/docker-libvips/blob/master/nodejs/10.9/Dockerfile

RUN apt-get update && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
  automake build-essential curl \
  cdbs debhelper dh-autoreconf flex bison \
  libjpeg-dev libtiff-dev libpng-dev libgif-dev librsvg2-dev libpoppler-glib-dev zlib1g-dev fftw3-dev liblcms2-dev \
  liblcms2-dev libmagickwand-dev libfreetype6-dev libpango1.0-dev libfontconfig1-dev libglib2.0-dev libice-dev \
  gettext pkg-config libxml-parser-perl libexif-gtk-dev liborc-0.4-dev libopenexr-dev libmatio-dev libxml2-dev \
  libcfitsio-dev libopenslide-dev libwebp-dev libgsf-1-dev libgirepository1.0-dev gtk-doc-tools \
  vim

ENV LIBVIPS_VERSION 8.8.1
COPY ./docker-config/resources/vips-${LIBVIPS_VERSION}.tar.gz /tmp/vips-${LIBVIPS_VERSION}.tar.gz

RUN \
  cd /tmp && \
  tar zxvf vips-${LIBVIPS_VERSION}.tar.gz  && \
  cd /tmp/vips-${LIBVIPS_VERSION} && \
  ls -al && \
  ./configure --enable-debug=no --without-python $1 && \
  make && \
  make install && \
  ldconfig

RUN \
  # Clean up
  apt-get remove -y automake curl build-essential && \
  apt-get autoremove -y && \
  apt-get autoclean && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# img-runner

ENV APP_ENV=production

COPY ./ /home/node/img-runner
COPY ./docker-config/scripts/start.sh /home/node/start.sh
WORKDIR /home/node/img-runner
VOLUME [ "/home/node/img-runner/storage" ]

RUN npm install -g node-gyp pm2 && npm install

EXPOSE 80

ENTRYPOINT [ "/home/node/start.sh" ]
