<script setup lang="ts">
import { Skeleton, Card, Row, Col } from 'ant-design-vue'

const SkeletonNode = Skeleton.Node
</script>

<template>
  <div
    aria-busy="true"
    aria-label="Loading dashboard"
  >
    <Skeleton
      :title="{ width: 200 }"
      :paragraph="false"
      active
    />
    <Skeleton
      :title="false"
      :paragraph="{ rows: 1, width: 300 }"
      active
      class="mt-2"
    />

    <Row
      :gutter="[16, 16]"
      class="mt-6"
    >
      <Col
        v-for="i in 4"
        :key="i"
        :xs="12"
        :sm="6"
      >
        <Card>
          <Skeleton
            :title="false"
            :paragraph="{ rows: 2, width: ['40%', '60%'] }"
            active
          />
        </Card>
      </Col>
    </Row>

    <Row
      :gutter="[16, 16]"
      class="mt-6"
    >
      <Col
        :xs="24"
        :lg="16"
      >
        <Card>
          <SkeletonNode
            active
            class="w-full! h-75!"
          />
        </Card>
      </Col>
      <Col
        :xs="24"
        :lg="8"
      >
        <Card>
          <Skeleton
            :title="{ width: 120 }"
            :paragraph="{ rows: 6 }"
            active
          />
        </Card>
      </Col>
    </Row>
  </div>
</template>
