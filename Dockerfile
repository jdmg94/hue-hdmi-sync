FROM debian:12

# OpenCV Setup

WORKDIR /opt

# configure your build
ARG OPENCV_VERSION=4.8.1

RUN apt-get update && apt-get install -y build-essential ca-certificates curl gnupg pkg-config avahi-utils
RUN apt-get install -y --no-install-recommends unzip git python3 cmake

RUN cmake_flags="-D CMAKE_BUILD_TYPE=RELEASE \
  -D BUILD_EXAMPLES=OFF \
	-D BUILD_DOCS=OFF \
	-D BUILD_TESTS=OFF \
	-D BUILD_PERF_TESTS=OFF \
	-D BUILD_JAVA=OFF \
	-D BUILD_opencv_apps=OFF \
	-D BUILD_opencv_aruco=OFF \
	-D BUILD_opencv_bgsegm=OFF \
	-D BUILD_opencv_bioinspired=OFF \
	-D BUILD_opencv_ccalib=OFF \
	-D BUILD_opencv_datasets=OFF \
	-D BUILD_opencv_dnn_objdetect=OFF \
	-D BUILD_opencv_dpm=OFF \
	-D BUILD_opencv_fuzzy=OFF \
	-D BUILD_opencv_hfs=OFF \
	-D BUILD_opencv_java_bindings_generator=OFF \
	-D BUILD_opencv_js=OFF \
  -D BUILD_opencv_img_hash=OFF \
  -D BUILD_opencv_line_descriptor=OFF \
  -D BUILD_opencv_optflow=OFF \
  -D BUILD_opencv_phase_unwrapping=OFF \
	-D BUILD_opencv_python3=OFF \
	-D BUILD_opencv_python_bindings_generator=OFF \
	-D BUILD_opencv_reg=OFF \
	-D BUILD_opencv_rgbd=OFF \
	-D BUILD_opencv_saliency=OFF \
	-D BUILD_opencv_shape=OFF \
	-D BUILD_opencv_stereo=OFF \
	-D BUILD_opencv_stitching=OFF \
	-D BUILD_opencv_structured_light=OFF \
	-D BUILD_opencv_superres=OFF \
	-D BUILD_opencv_surface_matching=OFF \
	-D BUILD_opencv_ts=OFF \
	-D BUILD_opencv_xobjdetect=OFF \
	-D BUILD_opencv_xphoto=OFF \
	-D CMAKE_INSTALL_PREFIX=/usr/local"

RUN curl -L -o opencv.zip https://github.com/opencv/opencv/archive/${OPENCV_VERSION}.zip
RUN unzip opencv.zip

RUN cd opencv-${OPENCV_VERSION} && \
 mkdir build && \
 cd build && \
 cmake $cmake_flags .. && \
 make -j $(nproc) && \
 make install && \
 sh -c 'echo "/usr/local/lib" > /etc/ld.so.conf.d/opencv.conf' && \
 ldconfig && \
 cd ../../../ && \
 rm -rf opencv

# add nodesource repository and install a specific node version
ARG NODEJS_MAJOR_VERSION=20
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODEJS_MAJOR_VERSION.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install nodejs -y
RUN rm -rf /var/lib/apt/lists/*

# install latest npm
RUN npm install -g npm@latest

# setup Opencv4nodejs to use local OpenCV build
ENV OPENCV4NODEJS_DISABLE_AUTOBUILD=1
ENV OPENCV_INCLUDE_DIR=/usr/local/include/opencv4
ENV OPENCV_LIB_DIR=/usr/local/lib
ENV OPENCV_BIN_DIR=/usr/local/bin

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install @u4/opencv4nodejs --unsafe-perm --verbose
RUN npm install

# cleanup
RUN apt-get purge -y build-essential curl unzip git cmake && apt-get autoremove -y --purge

# Copy the rest of the application code
COPY . .

# create a production build
RUN npm run build

EXPOSE 2100/udp

CMD ["npm", "run", "start:prod"]

